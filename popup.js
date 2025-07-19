// Modern Promise utilities

// 获取本地局域网IP
function getLocalIPs() {
    return new Promise((resolve) => {
        var ips = [];
        var IPV4 = /\b(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}\b/;
        
        var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
        
        if (!RTCPeerConnection) {
            resolve(ips);
            return;
        }

        var rtc = new RTCPeerConnection({
            iceServers: []
        });

        rtc.createDataChannel('');

        rtc.onicecandidate = function (e) {
            if (!e.candidate) {
                resolve(ips);
                return;
            }

            var ret = IPV4.exec(e.candidate.candidate);

            if (ret && ips.indexOf(ret[0]) === -1) {
                ips.push(ret[0]);
            }
        };
        
        rtc.createOffer()
            .then(sdp => rtc.setLocalDescription(sdp))
            .catch(err => {
                console.log(err);
                resolve(ips);
            });
    });
}

chrome.tabs.query({
    active       : true,
    currentWindow: true
}, function (tabs) {
    var url = tabs[0].url;
    var qr  = document.getElementById("qr");
    var txt = qr.querySelector('textarea');
    var img, qrcode, localIp;

    txt.value = url;

    // get storage options
    const optionsPromise = new Promise((resolve) => {
        chrome.storage.sync.get((options) => {
            resolve(options || {});
        });
    });

    // get local ip
    var promise;

    if (hostname(url) == 'localhost') {
        qr.classList.add('loading');
        promise = getLocalIPs();
    }

    Promise.all([optionsPromise, promise].filter(Boolean)).then(function (result) {
        var options = result[0];
        var ips     = result[1];

        var color;
        var text = url;

        if (options.isBlack) {
            color = '#000000';
        } else {
            color = randomColor({
                luminosity: 'dark'
            });
        }

        qr.classList.remove('loading');

        // localhost replace with local ip
        if (ips) {
            localIp = ips[0];

            if (localIp) {
                text    = url.replace('localhost', localIp);
            }
        } else {
            getLocalIPs().then(function (ips) {
                localIp = ips[0];
            });
        }

        // rewrite url
        txt.value = text;

        qrcode = new QRCode(qr, {
            text        : text,
            width       : 240,
            height      : 240,
            colorDark   : color,
            colorLight  : "#ffffff",
            correctLevel: QRCode.CorrectLevel.L
        });

        qr.querySelector('canvas').remove();

        img = qr.querySelector('img');
        img.addEventListener('click', showInput);
    });

    document.addEventListener('keypress', function (e) {
        if (e.which !== 13) {
            return;
        }

        // enter new line
        if (e.shiftKey || e.ctrlKey) {
            return;
        }

        // prevent new line
        e.preventDefault();

        if (img.classList.contains('hide')) {
            showMain();
        } else {
            showInput();
        }
    });

    function hostname(href) {
        var host;

        try {
            host = new (window.URL || window.webkitURL)(href).hostname;
        } catch (e) {}

        return host;
    }

    var localHosts = [
        'localhost',
        '127.0.0.0',
        '0.0.0.0'
    ];

    function showMain() {
        var text;
        var val = txt.value.trim();

        if (!val) {
            text      = url;
            txt.value = url;
        } else {
            text = val;
        }

        if (localIp && localHosts.indexOf(hostname(text)) > -1) {
            text = text.replace('localhost', localIp);
        }

        txt.value = text;
        qrcode.makeCode(text);

        txt.style.display = 'none';
        img.classList.remove('hide');
    }

    function showInput() {
        img.classList.add('hide');
        txt.style.display = 'block';

        txt.value = txt.value.trim();
        txt.select();
    }
});
