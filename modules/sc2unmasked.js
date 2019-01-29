const RequestPromise = require('request-promise');
const $ = require('cheerio');

const url = "http://sc2unmasked.com/";

module.exports = {
    'search': function(user, callback) {
        RequestPromise(url + "Search?q=" + user)
            .then(function(html){
                let playersFound = [];
                let results = $('tbody > tr > td.rank', html).toArray();
                try {
                    results.forEach(result => {
                        let region = result.children[0].attribs.alt.trim().toUpperCase();
                        let league = result.children[1].attribs.alt.trim();
                        let race = result.next.children[0].attribs.alt.trim();
                        let bnetLink = result.next.next.next.children[2].attribs.href.trim();
                        let ign = result.next.next.next.children[2].children[0].data;
                        let mmr = result.next.next.next.next.children[0].data;
                        let winRatioPercentage = result.next.next.next.next.next.children[0].data;
                        let winRatioGames = result.next.next.next.next.next.next.children[0].data;
                        let sc2Link = (result.next.next.next.next.next.next.next.next.next.children[0] !== undefined)
                            ? result.next.next.next.next.next.next.next.next.next.children[0].attribs.href
                            : "_No sc2replaystats linked_"
                        ;
                        playersFound.push({
                            'ign': ign,
                            'league': league,
                            'race': race,
                            'mmr': mmr,
                            'region': region,
                            'bnetLink': bnetLink,
                            'winRatioPercentage': winRatioPercentage,
                            'winRatioGames': winRatioGames,
                            'sc2Link': sc2Link,
                        });
                        console.log(league, race, bnetLink, ign, mmr, winRatioPercentage, winRatioGames, sc2Link);
                    });
                } catch (e) {
                    console.log(e);
                }
                callback(playersFound);
            })
            .catch(function(err){

            });
    }
};