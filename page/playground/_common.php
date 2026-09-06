<?php
use Gt\Dom\HTMLDocument;

function go(HTMLDocument $document):void {
	// Playground pages keep the shared head, without website navigation or footer.
	$document->querySelector(".site-footer")?->remove();
	$document->querySelector("section-switcher")?->remove();
	$heading = $document->querySelector("main h1");
	$title = $heading ? $heading->textContent . " — Flair playground" : "Flair playground";
	$document->querySelector("title")->textContent = $title;
	$document->querySelector('meta[property="og:title"]')->setAttribute("content", $title);
	$description = "Layout experiments using Flair’s shared styles and themes.";
	$document->querySelector('meta[name="description"]')->setAttribute("content", $description);
	$document->querySelector('meta[property="og:description"]')->setAttribute("content", $description);
}
