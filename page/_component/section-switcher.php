<?php
use Gt\Dom\Element;
use Gt\Http\Uri;

function go(Element $element, Uri $uri):void {
	foreach($element->querySelectorAll("option") as $option) {
		if(trim($uri->getPath(), "/") === "library/{$option->value}") {
			$option->setAttribute("selected", "");
		}
	}
}
