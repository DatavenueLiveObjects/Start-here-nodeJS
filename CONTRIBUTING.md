< [back](./README.md)

# How to contribute to this repository

## Make a release

Requirement: [gren](https://github.com/github-tools/github-release-notes)

Steps:
* clean your local git state (stash pending updates) 
* think about version tag `v<M>.<m>.<p>` (ex. `v1.0.10`).
* update `Milestone` field of related issues/PR.
* push new version using `npm version` (ex. for a patch)
```bash
# git stash save
npm version patch
# this will increment patch
```
* create GitHub release
```bash
gren release
# recreate release v1.0.2 with pull having milestone matching "v1.0.2"
gren release -t "1.0.1".."v1.0.2" -D prs --override
```
