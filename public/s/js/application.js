$(function() {

    $('body').personaAssistant({
        mode : 'application',
        onLogin : function() {
            alert('Logged In');
        },
        onLogout : function() {
            alert('Logged Out');
        }
    });

});
