var cp = require('child_process');

function simplifyNum(num){
    var multiplier = ['','k','m','b']
    var i;
    var _num = num;
    for(i=0;_num>=1000;i++){
        _num = _num/1000;
    }
    return String(Math.floor(_num*10)/10) +multiplier[i];
}

function _getUserInfo(username, callback){
    var data = '';
    cp.exec("curl 'https://www.instagram.com/" + username + "/' | grep 'window._sharedData'",
        function (stderr, stdout, stdin) {
            console.log('stdin: ' + stdin);
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            var str = stdout.replace('<script type="text/javascript">window._sharedData = ', '').replace(';</script>', '');
            data = JSON.parse(str);
            console.log(data);

            var profile = data.entry_data.ProfilePage;
            if (typeof profile === 'undefined') {
                callback({data:'UNKNOWN USER'});
                return;
            }
            var user = profile[0].user;

            if (user.is_private) {
                callback({data:'PRIVATE USER'});
                return;
            }
            var userBiography = user.biography;
            var userFullName = user.full_name;
            var userVerified = user.is_verified;
            var userProfile = user.profile_pic_url;
            var userLink = user.external_url;
            var username = user.username;
            var usermedia = user.media.nodes;
            var followed_by = user.followed_by.count;
            var follows = user.follows.count;
            var numPosts = usermedia.length;
            var numLikes = 0;
            var days = 0;
            if (numPosts > 0) {

                days = new Date(usermedia[0].date * 1000 - usermedia[numPosts - 1].date * 1000).getDate();

                for (var i = 0; i < numPosts; i++) {
                    numLikes += usermedia[i].likes.count;
                }

            }

            var dailyEngagement = (numLikes / days);
            var avgLikePerPost = numLikes / numPosts;
            var postCost = avgLikePerPost / 1000 * 200;//$200 CPM or $5 CPC
            var annualRev = postCost * 52; //Weekly promotions
            var smeerscore = Math.floor(Math.cbrt(followed_by)*10);

            var data = {
                smeerscore: smeerscore,
                userName: username,
                userFullName: userFullName,
                userBiography: userBiography,
                userVerified: userVerified,
                userProfile: userProfile,
                userLink: userLink,
                followed_by: simplifyNum(followed_by),
                follows: simplifyNum(follows),
                numPosts: simplifyNum(numPosts),
                estWorth: '$'+simplifyNum(Math.floor(annualRev * .6 / .25 * 1.5)),
                postCost: '$'+simplifyNum(Math.floor(postCost)),
                monthlyRev: '$'+simplifyNum(Math.floor(annualRev / 12)),
                annualRev: '$'+simplifyNum(Math.floor(annualRev)),
                engagementRate:  simplifyNum(Math.floor(avgLikePerPost) / followed_by * 100)+'%',
                dailyLikes: simplifyNum(Math.floor(dailyEngagement)),
                weeklyLikes: simplifyNum(Math.floor(dailyEngagement * 7)),
                monthlyLike: simplifyNum(Math.floor(dailyEngagement * 30)),
                yearlyLike: simplifyNum(Math.floor(dailyEngagement * 365))

            };

            callback({data:data});
        });
}
module.exports = {
    getUserInfo: _getUserInfo
};