async function fetchCryptoData(cryptoType) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoType}`);
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return null;
    }
}

async function fetchCryptoPriceHistory(cryptoType) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoType}/market_chart?vs_currency=usd&days=7`);
        const data = await response.json();
        return data.prices.map(price => ({
            x: price[0],
            o: price[1],
            h: price[1],
            l: price[1],
            c: price[1]
        }));
    } catch (error) {
        console.error('Error fetching crypto price history:', error);
        return [];
    }
}

async function fetchMarketData(cryptoType) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoType}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        return null;
    }
}

async function updateCryptoPrice(cryptoType) {
    const priceElement = document.getElementById('crypto-price-text');
    const logoElement = document.getElementById('crypto-logo');
    const cryptoData = await fetchCryptoData(cryptoType);
    if (cryptoData !== null) {
        priceElement.textContent = `Current ${cryptoType.charAt(0).toUpperCase() + cryptoType.slice(1)} Price: $${cryptoData.current_price}`;
        logoElement.src = cryptoData.image;
    } else {
        priceElement.textContent = 'Error fetching price';
        logoElement.src = '';
    }
}

async function updateMarketData(cryptoType) {
    const marketCapElement = document.getElementById('market-cap');
    const volume24hElement = document.getElementById('volume-24h');
    const totalSupplyElement = document.getElementById('total-supply');
    const circulatingSupplyElement = document.getElementById('circulating-supply');
    const marketListElement = document.getElementById('market-list');
    const moreMarketsElement = document.getElementById('more-markets');

    const marketData = await fetchMarketData(cryptoType);
    if (marketData !== null) {
        marketCapElement.textContent = `Market Cap: $${marketData.market_data.market_cap.usd}`;
        volume24hElement.textContent = `Volume (24h): $${marketData.market_data.total_volume.usd}`;
        totalSupplyElement.textContent = `Total Supply: ${marketData.market_data.total_supply}`;
        circulatingSupplyElement.textContent = `Circulating Supply: ${marketData.market_data.circulating_supply}`;
        
        marketListElement.innerHTML = '';
        const majorExchanges = marketData.tickers.slice(0, 5);
        majorExchanges.forEach((ticker, index) => {
            if (index < 4) {
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.src = ticker.market.logo;
                img.alt = ticker.market.name;
                img.onerror = () => img.style.display = 'none'; // Hide if image fails to load
                const span = document.createElement('span');
                span.textContent = ticker.market.name;
                li.appendChild(img);
                li.appendChild(span);
                marketListElement.appendChild(li);
            }
        });
        
        if (marketData.tickers.length > 5) {
            moreMarketsElement.style.display = 'block';
        } else {
            moreMarketsElement.style.display = 'none';
        }
    } else {
        marketCapElement.textContent = 'Market Cap: Error';
        volume24hElement.textContent = 'Volume (24h): Error';
        totalSupplyElement.textContent = 'Total Supply: Error';
        circulatingSupplyElement.textContent = 'Circulating Supply: Error';
        marketListElement.innerHTML = 'Error fetching markets';
        moreMarketsElement.style.display = 'none';
    }
}

async function updatePriceChart(cryptoType) {
    const priceHistory = await fetchCryptoPriceHistory(cryptoType);
    const ctx = document.getElementById('price-chart').getContext('2d');
    new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: `${cryptoType.charAt(0).toUpperCase() + cryptoType.slice(1)} Price Chart`,
                data: priceHistory
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }
            }
        }
    });
}

function detectCryptoType(address) {
    if (/^1[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address) || /^3[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) {
        return 'bitcoin';
    } else if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return 'ethereum';
    } else if (/^L[a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address) || /^M[a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address)) {
        return 'litecoin';
    } else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
        return 'solana';
    } else if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return 'supra';
    } else if (/^D[a-km-zA-HJ-NP-Z1-9]{26,34}$/.test(address)) {
        return 'cardano';
    } else if (/^G[A-Z0-9]{55}$/.test(address)) {
        return 'stellar';
    } else if (/^r[1-9a-km-zA-HJ-NP-Z]{25,34}$/.test(address)) {
        return 'ripple';
    } else if (/^[A-Za-z0-9]{53}$/.test(address)) {
        return 'deso';
    } else if (/^[A-Za-z0-9]{56}$/.test(address)) {
        return 'pi';
    }
    // Add more address patterns as needed
    return null;
}

document.getElementById('crypto-address').addEventListener('input', function() {
    const address = this.value;
    const cryptoType = detectCryptoType(address);
    if (cryptoType) {
        document.getElementById('crypto-type').value = cryptoType;
        updateCryptoPrice(cryptoType);
        updateMarketData(cryptoType);
        updatePriceChart(cryptoType);
    }
});

document.getElementById('crypto-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const cryptoType = document.getElementById('crypto-type').value;
    const cryptoAddress = document.getElementById('crypto-address').value;
    const qrCodeCanvas = document.getElementById('qrcode');
    const downloadButton = document.getElementById('download-button');
    
    // Create the URI scheme for the selected cryptocurrency
    const cryptoURI = `${cryptoType}:${cryptoAddress}`;
    
    // Clear any existing QR code
    qrCodeCanvas.getContext('2d').clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
    downloadButton.style.display = 'none';

    // Generate QR code
    QRCode.toCanvas(qrCodeCanvas, cryptoURI, function (error) {
        if (error) {
            console.error(error);
        } else {
            console.log('QR code generated!');
            // Show download button
            downloadButton.style.display = 'block';
        }
    });
});

document.getElementById('download-button').addEventListener('click', function() {
    const qrCodeCanvas = document.getElementById('qrcode');
    const cryptoType = document.getElementById('crypto-type').value;
    const downloadLink = document.createElement('a');
    downloadLink.href = qrCodeCanvas.toDataURL();
    downloadLink.download = `${cryptoType}_qrcode.png`;
    downloadLink.click();
    // Remove the previous QR code file from the file browser
    qrCodeCanvas.getContext('2d').clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
    downloadButton.style.display = 'none';
});

// Initialize with the default selected crypto type
const defaultCryptoType = document.getElementById('crypto-type').value;
updateCryptoPrice(defaultCryptoType);
updateMarketData(defaultCryptoType);
updatePriceChart(defaultCryptoType);
