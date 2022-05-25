cat > ~/.netrc <<EOF
    machine api.heroku.com
        login $HEROKU_EMAIL
        password $HEROKU_API_KEY
    machine git.heroku.com
        login $HEROKU_EMAIL
        password $HEROKU_API_KEY
EOF