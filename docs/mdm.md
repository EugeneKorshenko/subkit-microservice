


* create a Apple Enterprise Developer membership
* openssl genrsa -out privatekey.pem 2048
* openssl req -new -key privatekey.pem -outform DER -out customer.der
* go to [Apple push certificate](https://identity.apple.com/pushcert)


http://www.softhinker.com/in-the-news/iosmdmvendorcsrsigning