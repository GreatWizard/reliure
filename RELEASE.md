To release Reliure: 

- Switch to `master` branch and make sure it's up to date.
- Update the package.json `version` according to semver.
- Run:

```
git add .
git commit -m "vX.X.X"
git tag vX.X.X
git push origin --tags
```
