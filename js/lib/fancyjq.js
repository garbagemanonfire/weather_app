$(document).on('mouseenter','#elem', function(){
    $(this).popover('show');
});

$(document).on('mouseleave','#elem', function(){
    $(this).popover('hide');
});