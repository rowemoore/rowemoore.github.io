$(function(){
    $(".logo-pulse").fadeIn(500, function(){
        $(".logo-pulse").fadeOut(1000, function(){
            $("#preload").fadeOut(1000, function(){
                alert("loaded!");
            });
        });
    });
});