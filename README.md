# how-you-doin-world
Fetches forex and market data and shows a local perspective (CLP) of market fluctuations in near real-time

This tiny webpage project is my first approach to web development. It gets market data in near real-time (15 min delay), showing it in CLP for a local perspective.
For that, it connects with Alpha Vantage API (USD-CLP exchange rate) and with IEX Cloud API (SPY index, that follows S&P500, as a proxy for market data). It's limited to up to two refreshes per minute since it's using free API keys.

File description
================

index.html
Main webpage with 3 tiles: market fluctuation, USD to CLP fluctuation and total effect.

about.html
Simple page that descrives inspiration and objective

layout.css
Mainly focused on flexbox properties

styles.css
colors scheme and style organized per item

scripts.js
where magic gets to live... setup, execution, main functions and aux functions

================

Next steps: make a vue version as a new project
