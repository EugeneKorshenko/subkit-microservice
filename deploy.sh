NAME=$(npm ls --parseable | head -1 | awk -F/ '{print $NF}')
PACKAGE=$(npm ls --long | head -1 | awk -F/ '{print $NF}' |  tr @ -)
VERSION=$(npm ls --long | head -1 | awk -F/ '{print $NF}' |  tr @ - | awk -F- '{print $NF}' )

echo "add tag"
git tag $VERSION
git push origin master --tags
echo "tagging done"

echo "deployment started"
npm pack ./
git clone https://subkitagent:subkitagent007@github.com/SubKit/deploy.git
OLDNAME=$(git config --get user.name)
OLDEMAIL=$(git config --get user.email)
git config --global user.email "subkitagent@subkit.io"
git config --global user.name "SubKit Agent"
cp -f $PACKAGE.tgz ./deploy/$NAME-latest.tgz
mv -f $PACKAGE.tgz ./deploy
cd deploy
git add .
git commit -am "deployment"
git push origin master
git tag $PACKAGE
git push origin master --tags
echo "deployment done"
git config --global user.email $OLDEMAIL
git config --global user.name §OLDNAME