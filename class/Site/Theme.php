<?php
namespace App\Site;

use Gt\Http\ServerRequest;

class Theme {
	public static function current(ServerRequest $request):string {
		$theme = $request->getQueryParams()["theme"] ?? $request->getCookieParams()["flair-theme"] ?? "base";
		return in_array($theme, ["base", "ink", "paper", "vivid", "github", "material"], true) ? $theme : "base";
	}
	public static function scheme(ServerRequest $request):string {
		$scheme = $request->getQueryParams()["scheme"] ?? $request->getCookieParams()["flair-scheme"] ?? "system";
		return in_array($scheme, ["light", "dark"], true) ? $scheme : "system";
	}
}
