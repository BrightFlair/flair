<?php
use Gt\Dom\HTMLDocument;

function go(HTMLDocument $document):void {
	$heading = $document->querySelector(".library-heading h1");
	if(!$heading) {
		return;
	}
	$title = rtrim($heading->textContent, ".") . " — Flair";
	$document->querySelector("title")->textContent = $title;
	$document->querySelector('meta[property="og:title"]')->setAttribute("content", $title);
	$description = $document->querySelector(".library-description")->textContent;
	$document->querySelector('meta[name="description"]')->setAttribute("content", $description);
	$document->querySelector('meta[property="og:description"]')->setAttribute("content", $description);
}
