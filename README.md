# Generator
/project-root
│   index.html
│
└───css
│   │   styles.css
│
└───js
    │   scripts.js
    Explanation:
# HTML (index.html):

The page is split into two columns using a container div.
The left column contains the current market price chart and additional columns for market data and available markets.
The right column contains the QR code generator.
Additional coin options are added in the dropdown for Solana, Supra, ADA, XLM, XRP, DeSo, and Pi.
Chart.js and Chart.js Financial are included for the price chart.
# CSS (css/styles.css):

Contains the styling for the two-column layout to ensure it is responsive and visually appealing.
Updated to center the QR code column and the "Download QR Code" button, which only appears after the QR code is generated.
# JavaScript (js/scripts.js):

Contains the logic for detecting the cryptocurrency type, fetching the current market price, fetching the price history, fetching the market data, generating the QR code, and handling the download functionality.
The fetchMarketData function fetches market data for the selected coin including market cap, volume, total supply, circulating supply, and available markets.
The updateMarketData function updates the market data and available markets display, showing only major tier-1 exchanges (4/5) with a "more..." option.
The fetchCryptoPriceHistory function fetches historical price data for the selected coin and formats it for the candlestick chart.
The updatePriceChart function updates the chart with the fetched price history.
The detectCryptoType function handles additional coin address patterns.
The "Download QR Code" button only appears after the QR code is generated and is hidden again after the QR code is downloaded and removed from the canvas.
