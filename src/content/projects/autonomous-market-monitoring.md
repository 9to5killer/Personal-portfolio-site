---
title: "Autonomous Market Monitoring System"
num: "04"
tags: ["Python", "Alpaca API", "pandas", "Flask", "Plotly"]
status: "Live"
featured: true
summary: "A production AI agent that observes market conditions, evaluates signals, manages risk, and executes paper trades without human intervention — every hour the market is open."
---

## What it does

A fully autonomous trading agent built on the Alpaca Markets API. Every hour the market is open, it scans 10 equities against a multi-signal strategy — RSI, moving average crossover, and MACD — and executes paper trades with full risk management enforced at every layer.

The system includes a live Flask dashboard, a backtesting engine with Plotly charts, and parameters tuned via a sweep across 4 configurations and 365 days of hourly data.

## How it works

**Signal engine** — Requires confluence across multiple indicators. Price must be above the 50-bar trend SMA. Entry triggers on RSI dip below 40 or MA crossover confirmed by MACD histogram. No single-indicator trades.

**Risk layer** — Hard stop-loss at 3%. Trailing stop at 3.5% from peak. Daily loss circuit breaker halts all new trades if realized losses hit 5% of portfolio. Position size capped at 10% of available cash per trade.

**State management** — Thread-safe store tracks open positions, peak prices, bars held, cooldown periods after stop-loss exits, and full trade history across sessions.

**Dashboard** — Flask API with a vanilla JS frontend. Auto-refreshes every 30 seconds. Stop/Start controls. Accessible on local network from any device.

## Why I built it

Every enterprise AI agent I deploy at work follows the same architecture: ingest data, evaluate against rules, manage state, execute actions, observe outputs. The domain here is financial markets. The pattern is identical to any autonomous decision-making system.

Building this required making the same calls that matter in production AI: what signals to trust, what the system should never do autonomously, and how to tune parameters against real performance data rather than intuition.

The backtest engine made the tuning rigorous. Four configurations tested across four symbols over 365 days of hourly data. The winning config — RSI threshold 40, trailing stop 3.5%, minimum hold 3 bars — produced +$7,423 across the test portfolio versus +$6,639 for the baseline.

## Status

Live on paper trading. Monitoring performance before moving to live capital. Deployment to a DigitalOcean VPS for 24/7 operation is the next step.
