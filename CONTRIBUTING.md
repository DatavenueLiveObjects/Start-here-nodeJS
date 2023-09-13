< [back](./README.md)

# How to contribute to this repository

## Make a release

Requirement: [gren](https://github.com/github-tools/github-release-notes)

Steps:
* clean your local git state (stash pending updates) 
* think about version tag `<M>.<m>.<p>` (ex. `1.0.10`).
* update `Milestone` field of related issues/PR.
* push new version (ex. for a patch)
```bash
# git stash save
npm version patch
```
* create GitHub release
```bash
# recreate release 1.0.1 with pull releases having milestone matching "v1.0.1"
gren release -t 1.1.0..1.0.1
```
