Cross-Platform SQLCipher based keychain
=======================================

# Overview

This package presents a keychain abstraction.  A keychain is a per-user SQLite database encrypted with the user's password, and containing name/key pairs where the name represents a resource and the key is the password or encryption key for that resource. 

# Usage
Create a keychain for user "michael" with password "12345", then add password "asdfg" for resource "test".  Will throw an exception if the keychain already exists:
```
var kc = require("keychain-promise")()
kc.Create("michael","12345").then(db=>{
    return kc.Add(db,"test","asdfg")
}).then(ok => console.log(ok))
```

Retrieve the password and display for resource "test" for user "michael".  The returned key is contained in an object "row" with a key named "key":
```
var kc = require("keychain-promise")()
kc.Get("michael","abcd").then(db=>{
    return kc.Lookup(db,"test")
}).then(row=>console.log(row))
```

Remove the password for resource "test" for user "michael":
```
var kc = require("keychain-promise")()
var db
kc.Get("michael","abcd").then(d=>{
    db = d
    return kc.Remove(db,"test").then(ok=>console.log(ok))
}).then(row=>console.log(row))
```


# API


## Instantiation

```
var kc = require("keychain-promise")(options)
```
If options is present, it is expected to be an object.  The following keys are recognized:

```dir```: string path to the directory containing all keychains


## Create
```
Create(name,password)
=> Promise->db
```
Given a user name and password, create a Promise resolving to an open SQLite database handle for the user's keychain.  Throws an exception if the keychain already exists.


## Get
```
Get(user,password)
=> Promise->db
```
Given a user name and password, return a promise resolving to an open SQLite database handle for the user's already existing keychain.

## Lookup
```
Lookup(db,name)
=> Promise->key
```
Given an open SQLite database handle for the user's keychain, return the key for the specified
name.



## Add
```
UserKeyAdd(db,name,group)
=> Promise->bool
```
Given an open SQLite database handle for the user's keychain, a name, and the group that name belongs to, stores that name/group pair in the keychain.  If the group does not already exists, it is created with a random key.  Returns a promise which resolves to a boolean value indicating success or failure.


## Remove
```
Remove(db,name)
=> Promise->bool
```
Given an open SQLite database handle for the user's keychain, and a name, remove the name/key
pair from the keychain.  Returns a promise which resolves to a boolean value indicating success or failure.
