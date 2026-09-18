<?php
use App\Site\Theme;
use Gt\Dom\HTMLDocument;
use Gt\Http\ServerRequest;

function go(HTMLDocument $document, ServerRequest $request):void {
	$theme = Theme::current($request);
	$document->documentElement->setAttribute("data-flair-theme", $theme);
	$scheme = Theme::scheme($request);
	if($scheme !== "system") {
		$document->documentElement->setAttribute("data-theme", $scheme);
	}
	else {
		$document->documentElement->removeAttribute("data-theme");
	}
	if(isset($request->getQueryParams()["scheme"])) {
		setcookie("flair-scheme", $scheme, ["expires" => time() + 31536000, "path" => "/", "samesite" => "Lax"]);
	}
	if(isset($request->getQueryParams()["theme"])) {
		setcookie("flair-theme", $theme, [
			"expires" => time() + 31536000,
			"path" => "/",
			"samesite" => "Lax",
		]);
	}
}
