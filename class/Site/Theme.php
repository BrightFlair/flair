<?php
namespace App\Site;

use Gt\Http\ServerRequest;

class Theme {
	private const TINTS = [
		"base" => ["light" => "#111111", "dark" => "#f5f5f5"],
		"bright" => ["light" => "#9e77ed", "dark" => "#9e77ed"],
		"github" => ["light" => "#0969da", "dark" => "#4493f8"],
		"clean" => ["light" => "#204698", "dark" => "#9cbaff"],
		"gt" => ["light" => "#336699", "dark" => "#8cc8f5"],
	];
	private const PRIMARY_COLOURS = [
		"base" => ["light" => "#111111", "dark" => "#f5f5f5"],
		"bright" => ["light" => "#c328d1", "dark" => "#c328d1"],
		"github" => ["light" => "#1f883d", "dark" => "#3fb950"],
		"clean" => ["light" => "#204698", "dark" => "#9cbaff"],
		"gt" => ["light" => "#4f5b93", "dark" => "#aeb8ef"],
	];

	public static function current(ServerRequest $request):string {
		$theme = $request->getQueryParams()["theme"] ?? $request->getCookieParams()["flair-theme"] ?? "base";
		return is_string($theme) && isset(self::TINTS[$theme]) ? $theme : "base";
	}
	public static function scheme(ServerRequest $request):string {
		$scheme = $request->getQueryParams()["scheme"] ?? $request->getCookieParams()["flair-scheme"] ?? "system";
		return in_array($scheme, ["light", "dark"], true) ? $scheme : "system";
	}
	public static function tint(ServerRequest $request):?string {
		return self::customColour($request, "tint");
	}
	public static function primary(ServerRequest $request):?string {
		return self::customColour($request, "primary");
	}
	private static function customColour(ServerRequest $request, string $name):?string {
		$colour = $request->getQueryParams()[$name] ?? $request->getCookieParams()["flair-{$name}"] ?? null;
		if(!is_string($colour) || !preg_match("/^#[0-9a-f]{6}$/i", $colour)) {
			return null;
		}
		$colour = strtolower($colour);
		$submittedPreset = $request->getQueryParams()["{$name}-preset"] ?? null;
		if(is_string($submittedPreset) && strtolower($submittedPreset) === $colour) {
			return null;
		}
		return $colour;
	}
	public static function presetTint(string $theme, string $scheme = "light"):string {
		$scheme = $scheme === "dark" ? "dark" : "light";
		return self::TINTS[$theme][$scheme] ?? self::TINTS["base"][$scheme];
	}
	public static function presetPrimary(string $theme, string $scheme = "light"):string {
		$scheme = $scheme === "dark" ? "dark" : "light";
		return self::PRIMARY_COLOURS[$theme][$scheme] ?? self::PRIMARY_COLOURS["base"][$scheme];
	}
}
