<?php
namespace App\Site;

use Gt\Http\ServerRequest;

class Theme {
	private const TINTS = [
		"ink" => ["light" => "#666666", "dark" => "#aaaaaa"],
		"paper" => ["light" => "#8a4168", "dark" => "#e0a8c5"],
		"vivid" => ["light" => "#6025d6", "dark" => "#c3a0ff"],
		"github" => ["light" => "#0969da", "dark" => "#4493f8"],
		"material" => ["light" => "#786000", "dark" => "#e8d46e"],
		"clean-dashboard" => ["light" => "#6854c5", "dark" => "#c4b7ff"],
	];
	private const PRIMARY_COLOURS = [
		"ink" => ["light" => "#111111", "dark" => "#ffffff"],
		"paper" => ["light" => "#315c40", "dark" => "#a2c5a3"],
		"vivid" => ["light" => "#c7ff54", "dark" => "#c7ff54"],
		"github" => ["light" => "#1f883d", "dark" => "#3fb950"],
		"material" => ["light" => "#6750a4", "dark" => "#d0bcff"],
		"clean-dashboard" => ["light" => "#a918b8", "dark" => "#f06bf5"],
	];

	public static function current(ServerRequest $request):string {
		$theme = $request->getQueryParams()["theme"] ?? $request->getCookieParams()["flair-theme"] ?? "ink";
		// Base was the original user-facing Monochrome option. Ink is its
		// stronger replacement; keep old URLs and cookies working as an alias.
		if($theme === "base") {
			$theme = "ink";
		}
		return in_array($theme, ["ink", "paper", "vivid", "github", "material", "clean-dashboard"], true) ? $theme : "ink";
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
		$theme = $theme === "base" ? "ink" : $theme;
		$scheme = $scheme === "dark" ? "dark" : "light";
		return self::TINTS[$theme][$scheme] ?? self::TINTS["ink"][$scheme];
	}
	public static function presetPrimary(string $theme, string $scheme = "light"):string {
		$theme = $theme === "base" ? "ink" : $theme;
		$scheme = $scheme === "dark" ? "dark" : "light";
		return self::PRIMARY_COLOURS[$theme][$scheme] ?? self::PRIMARY_COLOURS["ink"][$scheme];
	}
}
