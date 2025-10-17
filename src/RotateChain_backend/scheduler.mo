import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Hash "mo:base/Hash";

actor SchedulerCanister {
    // Types
    public type TaskId = Nat;
    public type TaskType = {
        #oneTime;
        #recurring;
    };

    public type TaskStatus = {
        #scheduled;
        #executing;
        #completed;
        #cancelled;
        #failed;
    };

    public type Task = {
        id : TaskId;
        groupId:Nat;
        name : Text;
        taskType : TaskType;
        intervalSeconds : ?Nat; // For recurring tasks
        executeAt : Int; // Nanoseconds since epoch
        status : TaskStatus;
        lastExecution : ?Int;
        executionCount : Nat;
    };

    public type CreateTaskRequest = {
        name : Text;
        groupId:Nat;
        taskType : TaskType;
        delaySeconds : Nat; // Delay before first execution
        intervalSeconds : ?Nat; // For recurring tasks
    };

    // Callback function type
    public type TaskCallback = shared (groupId:Nat) -> async ();

    // State
    private stable var nextTaskId : TaskId = 0;
    private stable var taskEntries : [(TaskId, Task)] = [];
    
    // In-memory storage
    private let tasks = HashMap.HashMap<TaskId, Task>(10, Nat.equal, Hash.hash);
    private let taskCallbacks = HashMap.HashMap<TaskId, TaskCallback>(10, Nat.equal, Hash.hash);
    private let activeTimers = HashMap.HashMap<TaskId, Timer.TimerId>(10, Nat.equal, Hash.hash);

    // Initialize from stable storage after upgrade
    system func postupgrade() {
        for ((id, task) in taskEntries.vals()) {
            tasks.put(id, task);
            // Note: Callbacks are lost after upgrade and need to be re-registered
        };
    };

    // Save to stable storage before upgrade
    system func preupgrade() {
        taskEntries := Iter.toArray(tasks.entries());
    };

    // Create a new scheduled task
    public shared func createTask(request : CreateTaskRequest, callback : TaskCallback) : async Result.Result<TaskId, Text> {
        let taskId = nextTaskId;
        nextTaskId += 1;

        let now = Time.now();
        let executeAt = now + (Int.abs(request.delaySeconds) * 1_000_000_000);

        let task : Task = {
            id = taskId;
            name = request.name;
            groupId = request.groupId;
            taskType = request.taskType;
            intervalSeconds = request.intervalSeconds;
            executeAt = executeAt;
            status = #scheduled;
            lastExecution = null;
            executionCount = 0;
        };

        tasks.put(taskId, task);
        taskCallbacks.put(taskId, callback);

        // Schedule the execution
        switch (await scheduleExecution(taskId, task,request.groupId)) {
            case (#ok(timerId)) {
                activeTimers.put(taskId, timerId);
                return #ok(taskId);
            };
            case (#err(msg)) {
                // If scheduling fails, mark as failed and return error
                let failedTask = { task with status = #failed };
                tasks.put(taskId, failedTask);
                return #err("Failed to schedule task: " # msg);
            };
        };
    };

    // Schedule task execution using Timer module
    private func scheduleExecution(taskId : TaskId, task : Task,groupId:Nat) : async Result.Result<Timer.TimerId, Text> {
        let delay:Int = task.executeAt - Time.now();
        
        if (delay <= 0) {
            // Execute immediately if delay is negative or zero
            ignore executeTask(taskId,groupId);
            return #err("Task is already due");
        };

        let absoNat:Nat = Int.abs(delay);
         //#nanoseconds
        let delayDuration = #nanoseconds absoNat;

        try {
            let timerId = Timer.setTimer(
                delayDuration,
                func() : async () {
                    await executeTask(taskId,groupId);
                    
                    // Reschedule if it's a recurring task
                    switch (task.taskType, task.intervalSeconds) {
                        case (#recurring, ?interval) {
                            await rescheduleRecurringTask(taskId, interval,groupId);
                        };
                        case _ {};
                    };
                }
            );
            #ok(timerId)
        } catch (e) {
            #err("Timer setup failed: ")
        };
    };

    // Execute a task
    private func executeTask(taskId : TaskId,groupId:Nat) : async () {
        switch (tasks.get(taskId), taskCallbacks.get(taskId)) {
            case (null, _) { return };
            case (_, null) { 
                // No callback registered, mark as failed
                switch (tasks.get(taskId)) {
                    case (?task) {
                        let failedTask = { 
                            task with 
                            status = #failed;
                            lastExecution = ?Time.now();
                        };
                        tasks.put(taskId, failedTask);
                    };
                    case null {};
                };
                return;
            };
            case (?task, ?callback) {
                // Update task status to executing
                let updatingTask = { 
                    task with 
                    status = #executing;
                    lastExecution = ?Time.now();
                };
                tasks.put(taskId, updatingTask);

                try {
                    // Execute the callback function
                    await callback(groupId);
                    
                    // Update task status and count
                    let completedTask = { 
                        updatingTask with 
                        status = switch (task.taskType) {
                            case (#oneTime) { #completed };
                            case (#recurring) { #scheduled }; // Keep scheduled for recurring tasks
                        };
                        executionCount = updatingTask.executionCount + 1;
                    };
                    tasks.put(taskId, completedTask);

                } catch (e) {
                    // Mark as failed if execution fails
                    let failedTask = { 
                        updatingTask with 
                        status = #failed 
                    };
                    tasks.put(taskId, failedTask);
                };

                // Remove timer from active timers for one-time tasks
                if (task.taskType == #oneTime) {
                    activeTimers.delete(taskId);
                };
            };
        };
    };

    // Reschedule a recurring task
    private func rescheduleRecurringTask(taskId : TaskId, intervalSeconds : Nat,groupId:Nat) : async () {
        switch (tasks.get(taskId)) {
            case (null) {};
            case (?task) {
                let newExecuteAt = Time.now() + (Int.abs(intervalSeconds) * 1_000_000_000);
                let updatedTask = { 
                    task with 
                    executeAt = newExecuteAt;
                    status = #scheduled;
                };
                
                tasks.put(taskId, updatedTask);
                
                // Schedule next execution
                switch (await scheduleExecution(taskId, updatedTask,groupId)) {
                    case (#ok(timerId)) {
                        activeTimers.put(taskId, timerId);
                    };
                    case (#err(msg)) {
                        // Log error but don't fail the reschedule
                        let failedTask = { updatedTask with status = #failed };
                        tasks.put(taskId, failedTask);
                    };
                };
            };
        };
    };

    // Cancel a scheduled task
    public shared func cancelTask(taskId : TaskId) : async Result.Result<(), Text> {
        switch (tasks.get(taskId), activeTimers.get(taskId)) {
            case (?task, ?timerId) {
                // Cancel the timer
                Timer.cancelTimer(timerId);
                
                // Update task status
                let cancelledTask = { task with status = #cancelled };
                tasks.put(taskId, cancelledTask);
                activeTimers.delete(taskId);
                taskCallbacks.delete(taskId);
                
                return #ok();
            };
            case (?task, null) {
                // Task exists but no active timer
                let cancelledTask = { task with status = #cancelled };
                tasks.put(taskId, cancelledTask);
                taskCallbacks.delete(taskId);
                return #ok();
            };
            case (null, _) {
                return #err("Task not found");
            };
        };
    };

    // Register a callback for an existing task
    public shared func registerCallback(taskId : TaskId, callback : TaskCallback) : async Result.Result<(), Text> {
        switch (tasks.get(taskId)) {
            case (null) {
                #err("Task not found")
            };
            case (?task) {
                taskCallbacks.put(taskId, callback);
                #ok()
            };
        };
    };

    // Get task information
    public query func getTask(taskId : TaskId) : async ?Task {
        tasks.get(taskId)
    };

    // Get all tasks
    public query func getAllTasks() : async [Task] {
        Iter.toArray(tasks.vals())
    };

    // Get tasks by status
    public query func getTasksByStatus(status : TaskStatus) : async [Task] {
        let filtered = Buffer.Buffer<Task>(10);
        for (task in tasks.vals()) {
            if (task.status == status) {
                filtered.add(task);
            };
        };
        Buffer.toArray(filtered)
    };

    // Get active timer count
    public query func getActiveTimerCount() : async Nat {
        activeTimers.size()
    };

    // Clean up completed one-time tasks
    public shared func cleanupCompletedTasks() : async Nat {
        var removedCount = 0;
        let toRemove = Buffer.Buffer<TaskId>(10);
        
        for ((taskId, task) in tasks.entries()) {
            if (task.taskType == #oneTime and 
                (task.status == #completed or task.status == #cancelled or task.status == #failed)) {
                toRemove.add(taskId);
            };
        };
        
        for (taskId in toRemove.vals()) {
            tasks.delete(taskId);
            activeTimers.delete(taskId);
            taskCallbacks.delete(taskId);
            removedCount += 1;
        };
        
        removedCount
    };
}