---
layout: default
title: Introduction
nav_order: 1
description: 'Documentation for @42.nl/react-authentication.'
has_children: true
permalink: /
---

[![Build Status](https://travis-ci.org/42BV/react-authentication.svg?branch=master)](https://travis-ci.org/42BV/react-authentication)
[![Codecov](https://codecov.io/gh/42BV/react-authentication/branch/master/graph/badge.svg)](https://codecov.io/gh/42BV/react-authentication)

This is 42's authentication module for React in combination with
a specific Spring Security settings.

It can do the following things:

1. Log the user in and out with your Spring application.
2. Saving the current user in a store
3. Send 'fetch' request with XSRF tokens and the cookies.
4. Make a route only available for logged in users.
5. Make a route available for specific users, based on properties
    of the current user.
6. Make the state of the store available as handy set of hooks.


