## Local Development and Execution
`npm run dev` starts the React frontend on port 3000 and the express backend on port 5000.

This answer used for multi-github account setup: https://stackoverflow.com/a/9348040
(Make sure both accounts are listed via `ssh-add -l`, and use `ssh-add <rsa_file>` to add if not)

## To Do
### Queue (Not supported by spotify api)
- see if the web api has a queue remove function it uses from browser
- Clear queue on startup
  - Or alert queue size
- Don't add to queue unless size is 0/1
### Other
- Add scrubber, or skip button
- Display configuration of playlists from get go
  - Modifiable through UX?
- External configuration
- Graceful shutdown
- Refactoring and cleanup
- Lower left hand corner for queue
- Better error handling
- linting
- skip initial spotify button
- add dev mode that makes loading faster