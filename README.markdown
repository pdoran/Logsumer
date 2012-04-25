Logsumer
========

[![Build Status](https://secure.travis-ci.org/pdoran/Logsumer.png?branch=master)](http://travis-ci.org/pdoran/Logsumer)

log api requirements:
---------------------

* take in log data as fast as possible (how many per second per customer)
  * Push in to memory?
* Search by day
* Search by log level
* Search by error id
* Search by site(client)
* Advanced Search
* CHange feed
* Allow for any data source (create interface)
* Job queue to do duplicates (this is purely data and not required)

Web Interface
-------------

* List of log entries (log entry template, log model, log collection)
	* Unread marker
	* Duplicate indicator/viewer
	* Scrollspy to quick jump to date/times
* Filters (filter view, filter tabs(?), filter model)
	* Multiple filter views
	* Save filters	
* Search capability (quick filtering -> input to filter model)
  * Site
  * Date/time between
  * Thread Id
  * Level
  * Error id
* Add info to a log (unread/comments)
* Show duplicates (this is data)
