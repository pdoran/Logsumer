//
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

(function($) {
  return jQuery.fn.insertAt = function(index, element) {
    var lastIndex;
    if (index <= 0) return this.prepend(element);
    lastIndex = this.children().size();
    if (index >= lastIndex) return this.append(element);
    return $(this.children()[index - 1]).after(element);
  };
})(jQuery);