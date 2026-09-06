<?php
use App\Site\Theme;
use Gt\Dom\HTMLDocument;
use Gt\Http\ServerRequest;

function go(HTMLDocument $document, ServerRequest $request):void {
	$theme = Theme::current($request);
	$document->documentElement->setAttribute("data-theme", $theme);
	if(isset($request->getQueryParams()["theme"])) {
		setcookie("flair-theme", $theme, [
			"expires" => time() + 31536000,
			"path" => "/",
			"samesite" => "Lax",
		]);
	}
}
