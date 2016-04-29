module.exports = createSemverLabeler

var async = require('async')
  , parseFixesAndFeatures = require('./fixes-and-features-parser')

function createSemverLabeler () {

  function applySemverLabel (releasePr, cb) {
    var semver = determineSemver(releasePr.body)
      , currentSemverLabel = null
      , tasks = []

    releasePr.labels.some(function (label) {
      if (label.indexOf('semver/') === 0) {
        currentSemverLabel = label
        return true
      }
    })

    if ('semver/' + semver === currentSemverLabel) return cb()

    function removeSemverLabel (cb) {
      releasePr.removeLabel(currentSemverLabel, cb)
    }

    function addNewSemverLabel (cb) {
      var label = 'semver/' + semver
      releasePr.addLabels([ label ], cb)
    }

    if (currentSemverLabel) {
      tasks.push(removeSemverLabel)
    }
    if (semver) {
      tasks.push(addNewSemverLabel)
    }

    async.series(tasks, cb)
  }

  function determineSemver (body) {
    var data = parseFixesAndFeatures(body)
      , fixes = data.fixes
      , features = data.features
      , semver = null

    if (features.length >= 10) {
      semver = 'major'
    } else if (features.length > 0 && features.length < 10) {
      semver = 'minor'
    } else if (fixes.length > 0) {
      semver = 'patch'
    }

    return semver
  }

  return applySemverLabel
}
