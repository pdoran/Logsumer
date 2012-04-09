Logsumer
========

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

* Search capability
  * Site
  * Date/time between
  * Thread Id
  * Level
  * Error id
* Add info to a log (unread/comments)
* Show duplicates (this is data)