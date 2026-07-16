# 2. Permissionless market creation with bounded parameters

## Context

Someone has to decide which markets exist. A governed allowlist means a gatekeeper
and a political process. Fully open creation means anyone can deploy a market with
a 99% LLTV and a manipulable oracle, and it will carry this protocol's name.

Isolation changes the calculus: a bad market can only drain itself. Its damage does
not reach other markets.

## Decision

Anyone may create a market with any collateral asset, loan asset, and oracle. The
LLTV and the interest rate model must come from an enumerated set of approved
values.

## Consequences

New asset pairs can be listed without asking permission, which is the point of a
permissionless protocol. Users of a market with a bad oracle bear that risk alone.

The cost is that reckless markets can exist under this protocol's name, and users
must evaluate a market's oracle themselves. Bounding LLTV and the rate model
removes the two footguns most likely to produce guaranteed bad debt, but it does
not make an arbitrary oracle safe. That risk is disclosed, not eliminated.
