// ----------------------------------------------------------------------------
//
// jquery.persona-assistant.js
//
// Copyright (c) Andrew Chilton 2013 - http://chilts.org/blog/
//
// License - http://chilts.mit-license.org/2013/
//
// ----------------------------------------------------------------------------

(function($) {

    // create all of our command functions
    var commands = {

        'init' : function(options) {
            var $body = this;
            if ( $body.size() === 0 || $body.size() > 1 ) {
                console.log('The matching element set for personaAssistant should be of length one');
                return;
            }

            // create and store the 'opts' data on the element
            var opts = $.extend({}, $.fn.personaAssistant.defaults, options);
            $body.data('opts', opts);

            // get the user
            var user = $body.data('email');

            // setup some functions which can help us
            function showLoggedIn() {
                $(opts.loggedInSelector).show();
                $(opts.loadingSelector).hide();
                $(opts.loggedOutSelector).hide();
            }
            function showLoading() {
                $(opts.loggedInSelector).hide();
                $(opts.loadingSelector).show();
                $(opts.loggedOutSelector).hide();
            }
            function showLoggedOut() {
                $(opts.loggedInSelector).hide();
                $(opts.loadingSelector).hide();
                $(opts.loggedOutSelector).show();
            }

            // if we *think* someone is logged in, show that, else show them as logged out
            if ( user ) {
                showLoggedIn();
            }
            else {
                showLoggedOut();
            }

            // when someone clicks the login button, request Persona to authenticate the user
            $(opts.loginBtn).click(function(ev) {
                ev.preventDefault();
                showLoading();
                console.log('Clicked login ...');
                navigator.id.request();
            });

            // when someone clicks the logout button, tell Persona to logout
            $(opts.logoutBtn).click(function(ev) {
                ev.preventDefault();
                console.log('Clicked logout ...');
                navigator.id.logout();
            });

            // now, call the navigator.id.watch() so we can see what is going on
            navigator.id.watch({
                loggedInUser : user,
                onlogin : function(assertion) {
                    // A user has logged in! Here you need to:
                    // 1. Send the assertion to your backend for verification and to create a session.
                    // 2. Update your UI.
                    console.log('onlogin(): entry');

                    // show only the loading elements
                    showLoading();

                    $.ajax({
                        type: 'POST',
                        url: '/login',
                        data: { assertion : assertion },
                        success: function(res, status, xhr) {
                            console.log(res);

                            // store the email address on $body
                            $body.data('email', res.email);
                            // ... and show it on the page (if opts.storeEmailSelector matches any element)
                            $(opts.storeEmailSelector).text(res.email);

                            // now show the relevant things
                            showLoggedIn();
                        },
                        error: function(xhr, status, err) {
                            navigator.id.logout();
                        }
                    });
                },
                match : function() {
                    console.log('match(): entry');
                },
                onlogout : function() {
                    // A user has logged out! Here you need to:
                    // Tear down the user's session by redirecting the user or making a call to your backend.
                    console.log('onlogout(): entry');
                    showLoggedOut();
                }
            });

            return this;
        }

    };

    // plugin 'personaAssistant'
    $.fn.personaAssistant = function(command, options) {

        // Method calling logic
        if ( commands[command] ) {
            return commands[command].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof command === 'object' || ! command ) {
            return commands.init.apply( this, arguments );
        } else {
            $.error( 'Command ' +  command + ' does not exist on jQuery.personaAssistant' );
        }

    }

    // plugin defaults
    $.fn.personaAssistant.defaults = {
        // default mode is 'classic' (out of 'classic' and 'application')
        mode               : 'classic',

        // queries to show/hide elements at the appropriate time
        loggedInSelector   : '.persona-logged-in',
        loadingSelector    : '.persona-loading',
        loggedOutSelector  : '.persona-logged-out',

        // buttons to log in/out
        loginBtn           : '#persona-login',
        logoutBtn          : '#persona-logout',

        // where to set the email we received back (optional)
        storeEmailSelector : '.persona-email',

        // events you can listen on so you can do something else appropriate
        onLogin            : function(user) {},
        onLogout           : function() {},
        onLoading          : function() {}
    };

})(jQuery);

// ----------------------------------------------------------------------------
