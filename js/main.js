document.addEventListener('DOMContentLoaded', function() {
    var data1 = {
        labels: [0],
        datasets: [{
            label: 'PhotoDiode',
            data: [25],
            borderColor: '#287bff',
            tension: 0.4
        }]
    };

    var config1 = {
        type: 'line',
        data: data1,
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 10,
                    max: 45,
                }
            }
        }
    };

    var data2 = {
        labels: [0],
        datasets: [{
            label: 'Temperature',
            data: [90],
            borderColor: '#ff6384',
            tension: 0.4
        }]
    };

    var config2 = {
        type: 'line',
        data: data2,
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 0,
                    max: 200,
                }
            }
        }
    };

    var myChart1 = new Chart(
        document.getElementById('myChart'),
        config1
    );

    var myChart2 = new Chart(
        document.getElementById('myChart2'),
        config2
    );
});

async function GetDataFormSheet() {
    let apiURL = `https://script.google.com/macros/s/AKfycbxQ-sZtcPznUa6MYrPG2Pk9u_ur7ggkkvoAPdEfgTd5VAkSKQ6Dp4JUwycphzb0Wq5z/exec`;
    let datas = await fetch(apiURL).then(res => res.json());
    console.log(datas);
    let dts = datas.slice(0, 10).reverse(); // Get the last 10 elements and reverse them
    console.log(dts);
    dts.forEach(function(dt) {
        data1.labels.push(dt.time);
        data1.datasets[0].data.push(dt.temp);
        data2.labels.push(dt.time);
        data2.datasets[0].data.push(dt.adc);
    });
    myChart1.update();
    myChart2.update();
}

async function processData() {
    await GetDataFormSheet();

    DataRef.child('NhietDo').on('value', (snapshot) => {
        const temp = snapshot.val();
        var now = new Date();
        now = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        if (data1.datasets[0].data.length >= 10) {
            data1.labels.shift();
            data1.datasets[0].data.shift();
        }
        data1.labels.push(now);
        data1.datasets[0].data.push(temp);
        myChart1.update();
    });

    DataRef.child('SoDien').on('value', (snapshot) => {
        const adc = snapshot.val();
        var now = new Date();
        now = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        if (data2.datasets[0].data.length >= 10) {
            data2.labels.shift();
            data2.datasets[0].data.shift();
        }
        data2.labels.push(now);
        data2.datasets[0].data.push(adc);
        myChart2.update();
    });
}

processData();
var DataRef = firebase.database().ref(); // Adjust this based on your Firebase configuration

DataRef.child('DoAm').on('value', (snapshot) => {
    const humi = snapshot.val();
    let humidityElement = document.getElementById('humidity');
    if (humidityElement) {
        humidityElement.innerHTML = `${humi}<span>%</span>`;
        document.documentElement.style.setProperty('--humidity-value', humi);
    }
});

if (database && database['Acount'] && database['Acount'][0]) {
    console.log(database['Acount'][0].name);
}


