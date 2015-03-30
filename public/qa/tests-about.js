suite('"About" Page Tests',function(){
	test('page should contain linke to contact page',function(){
		console.log($('a[href="/contact"]').length);
		assert($('a[href="/contact"]').length);
	});
});