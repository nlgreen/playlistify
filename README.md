## Local Development and Execution
`npm run dev` starts the React frontend on port 3000 and the express backend on port 5000.

This answer used for multi-github account setup: https://stackoverflow.com/a/9348040
(But it's already set up, so just make sure both accounts are listed via `ssh-add -l`, and use `ssh-add <rsa_file>` to add if not. You can find the key listed
in `~/.ssh/config`). The git config file (`.git/config`) in the repo should already have it configured:
```
[user]
        name = ...
        email = ...
[remote "origin"]
        url = git@github.com-personal:nlgreen/playlistify.git
        fetch = +refs/heads/*:refs/remotes/origin/*
```

## To Do
### Queue (Not supported by spotify api)
- see if the web api has a queue remove function it uses from browser
- Clear queue on startup
  - Or alert queue size
- Don't add to queue unless size is 0/1
### Refactoring
- separate validations file
- test leaving tab and coming back
- linting
- General refactoring and cleanup
- change GET to POST where appropriate (and general REST improvements of api)
- move toast to common util

### Performance
- Better error handling
- add dev mode that makes loading faster
- Graceful shutdown

### Features
- Add scrubber, or skip ahead button
- Display configuration of playlists from get go
  - Modifiable through UX?
- External configuration
- Lower left hand corner for queue
- skip initial spotify button
- verify that song is in playlist after adding
- Migrate system to use a single "processed" playlist instead of sifting through all of them to determine the state
- Song loading indicator on processed songs, like the liked songs has
- Remove songs from playlist (if accidently clicked)
- Token refreshing
- Add a new playlist