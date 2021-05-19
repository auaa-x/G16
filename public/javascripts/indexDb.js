(function(){
    var dbObject = {}; 
    dbObject.init = function(params){
        this.db_name = params.db_name;
        this.db_version = params.db_version;
        this.db_store_name = params.db_store_name;
        if (!window.indexedDB) 
        {
            window.alert("Your browser does not support IndexDB, please change your browser");
        }
 
        var request = indexedDB.open(this.db_name,this.db_version);
        //Failed to open data
        request.onerror = function(event) 
        { 
            alert("It cannot open the database, error code: " + event.target.errorCode);
        };
        request.onupgradeneeded = function(event) 
        {
            this.db = event.target.result; 
            this.db.createObjectStore(dbObject.db_store_name);
        };
        //Open the database
        request.onsuccess = function(event) 
        {
            //Asynchronous notification is used here. When using curd, please trigger through events
            dbObject.db = event.target.result;
        };
    };
    /**
     * Add and edit operations
     */
    dbObject.put = function(params,key)
    {
        //Things must be declared explicitly here
        var transaction = dbObject.db.transaction(dbObject.db_store_name, "readwrite");
        var store = transaction.objectStore(dbObject.db_store_name);
        var request = store.put(params,key);
        request.onsuccess = function(){
            //alert('Added successfully');
        };
        request.onerror = function(event){
            console.log(event);
        }
    };
    /**
     * delete data
     */
    dbObject.delete = function(id)
    {
        // dbObject.db.transaction.objectStore is not a function
        request = dbObject.db.transaction(dbObject.db_store_name, "readwrite").objectStore(dbObject.db_store_name).delete(id);
        request.onsuccess = function(){
            //alert('successfully deleted');
        }
    };
 
    /**
     * Query operation
     */
    dbObject.select = function(key)
    {
        //The second parameter can be omitted
        var transaction = dbObject.db.transaction(dbObject.db_store_name,"readwrite");
        var store = transaction.objectStore(dbObject.db_store_name);
        if(key)
            var request = store.get(key);
        else
            var request = store.getAll();
 
        request.onsuccess = function () {
            console.log(request.result);
        }
    };
    /**
     * Clear the entire object store (table)
     */
    dbObject.clear = function()
    {
        var request = dbObject.db.transaction(dbObject.db_store_name,"readwrite").objectStore(dbObject.db_store_name).clear();
        request.onsuccess = function(){
            //alert('Cleared successfully');
        }
    }; 
    window.dbObject = dbObject;
})();