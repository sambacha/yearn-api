'use strict';

const handler = require('../../../../lib/handler');
const dynamodb = require('../../../../utils/dynamoDb');
const _ = require('lodash');

const db = dynamodb.doc;

const getRepos = async () => {
  const params = {
    TableName: 'repos',
  };
  const entries = await db.scan(params).promise();
  const repos = entries.Items;
  return repos;
};

module.exports.handler = handler(async () => {
  const repos = await getRepos();
  const contributorMap = {};

  const contributorEntries = _.union(
    ..._.map(repos, (repo) => repo.contributors),
  );

  const updateContributor = (contributor) => {
    const { login } = contributor;
    let { contributions = 0 } = contributor;
    const foundContributor = contributorMap[login];
    if (foundContributor) {
      const { contributions: previousContributions } = foundContributor;
      contributions += previousContributions;
      contributor.contributions = contributions;
    }
    contributorMap[login] = contributor;
  };

  _.each(contributorEntries, updateContributor);

  const contributors = _.map(contributorMap);

  // const orderedContributions = _.orderBy(contributors, "contributions", "desc");
  return contributors;
});
