< [back](./README.md)

# HowTo Contribute

Please create an [issue](https://github.com/DatavenueLiveObjects/Start-here-nodeJS/issues) describing your goal / question / bug description...

If you're interested in an existing issue, please contribute by up-voting for it by adding a :+1:.

If you want to push some code :
- fork and prepare a feature-git-branch, then create a [pull request](https://github.com/DatavenueLiveObjects/Start-here-nodeJS/pulls) that link your issue.
- execute a minimal (manual) tests

You could also be critic with existing ticket/PR : all constructive feedbacks are welcome.

## HowTo execute tests
* for now there is no automated test. PR are welcome.

## HowTo release using `gh`

Install and create automatically a draft release version using [gh client](https://cli.github.com/)
- the version tag must exist

Example to create v1.0.4
```bash
gh release create v1.0.4 --draft --generate-notes
```
this will make a new draft release. Verify it in [releases list](https://github.com/DatavenueLiveObjects/Start-here-nodeJS)

- publish the release when ready