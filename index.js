var fs = require("fs")
var sqlite3 = require("cross-sqlcipher-promise")

var USERDIR = "" 

/*
  Keychain:
  Get:    UserKeyChain(user,password) => Promise(db)
  Create: UserKeychainCreate(name,password) => Promise(db)
  Lookup: UserKeyLookup(db) => Promise(key)
  Add:    UserKeyAdd(db,name,key) => Promise(bool)
  Remove: UserKeyRemove(db,name) => Promise(bool)
  Groups: Group(db) => ...
*/
function SQLEncode(str) {
    return  (""+str).replace(/'/g,"''")
}

// user names can only contain alphanumeric characters and underscores
function UserKeychainCreate(user_String,passwd_String) {
    user_String = user_String.replace(/[^A-Za-z0-9_]/gmi,"")
    if (fs.existsSync(USERDIR+user_String)) throw "keychain already exists"
    passwd_String = "'"+SQLEncode(passwd_String)+"'"
    var db = new sqlite3.Database(USERDIR+user_String)
    db.serialize()
    return db.exec("PRAGMA cipher_default_kdf_iter='64000';").then(()=> {
	return db.exec("PRAGMA KEY="+passwd_String+";")
    }).then(()=>{
	return db.exec("CREATE TABLE keys(name TEXT PRIMARY KEY,key BLOB);",_)
    }).then(()=>db)
}

function UserKeychain(user_String,passwd_String) {
    user_String = user_String.replace(/[^A-Za-z0-9_]/gmi,"")
    if (!fs.existsSync(USERDIR+user_String)) return false
    passwd_String = "'"+SQLEncode(passwd_String)+"'"
    var db = new sqlite3.Database(USERDIR+user_String)
    db.serialize()
    return db.exec("PRAGMA cipher_default_kdf_iter='64000';").then(()=> {
	return db.exec("PRAGMA KEY="+passwd_String+";")
    }).then(()=>db)
}

function UserKeyAdd(db_DB,name_String,key_String) {
    return db_DB.prepare("INSERT OR REPLACE INTO keys (name,key) VALUES (?,?)",
			 [name_String,key_String])
	.then(stmt=>stmt.run())
	.then(stmt => {
	    var rowid_Integer = stmt.lastID
	    stmt.finalize()
	    return rowid_Integer > 0
	})
}

function UserKeyRemove(db_DB,name_String) {
    return db_DB.prepare("DELETE FROM keys WHERE name=?",[name_String])
	.then(stmt=>stmt.run())
	.then(stmt=> {
	    var changes_Integer = stmt.changes
	    stmt.finalize()
	    return changes_Integer > 0
	})
}

function UserKeyLookup(db_DB,name_String) {
    return db_DB.get("SELECT key FROM keys WHERE name=?",name_String)
}

module.exports = function(config) {
    if (typeof config == "object") {
	if ("dir" in config) {
	    USERDIR = config.dir
	}
    }
    return {
	Create:UserKeychainCreate,
	Get:UserKeychain,
	Add:UserKeyAdd,
	Lookup:UserKeyLookup,
	Remove:UserKeyRemove
    }
}
