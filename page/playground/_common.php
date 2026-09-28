<?php
use Gt\Dom\HTMLDocument;

function go(HTMLDocument $document):void {
	// The index remains part of the website navigation. Individual examples
	// remove that chrome and receive one consistent route back to the index.
	$document->querySelector(".site-footer")?->remove();
	$isIndex = (bool)$document->querySelector(".playground-index");
	if(!$isIndex) {
		$document->querySelector("section-switcher")?->remove();
		$closeLink = $document->createElement("a");
		$closeLink->className = "playground-close";
		$closeLink->setAttribute("href", "/playground/");
		$closeLink->textContent = "Close example";
		$document->body->appendChild($closeLink);
	}
	$heading = $document->querySelector("main h1");
	$title = $heading ? $heading->textContent . " — Flair playground" : "Flair playground";
	$document->querySelector("title")->textContent = $title;
	$document->querySelector('meta[property="og:title"]')->setAttribute("content", $title);
	$description = "Layout experiments using Flair’s shared styles and themes.";
	$document->querySelector('meta[name="description"]')->setAttribute("content", $description);
	$document->querySelector('meta[property="og:description"]')->setAttribute("content", $description);
}
