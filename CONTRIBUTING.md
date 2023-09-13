< [back](./README.md)

# How to contribute to this repository

## Make a release

Requirement: setup [gren](https://github.com/github-tools/github-release-notes) ([doc](https://github.com/github-tools/github-release-notes#setup))
````bash
npm install github-release-notes -g
export GREN_GITHUB_TOKEN=my_token_having_good_scope_on_target_repo
````

Steps:
* clean your local git state (`git stash` pending updates) 
* think about version tag `v<M>.<m>.<p>` (ex. `v1.0.10`).
* update `Milestone` field of related issues/PR.
* push new version using `npm version` (ex. for a `patch` under)
```bash
# git stash save
npm version patch
# this will increment patch part of current package.json versions
```
* create GitHub release
```bash
gren release
# exemple to recreate a release v1.0.2 with pull requests having milestone matching "v1.0.2"
gren release -t "1.0.1".."v1.0.2" -D prs --override
```
[//]: <> (NB: it seems there is an issue to include issues in release note ..? so use PRs as fallback right now)