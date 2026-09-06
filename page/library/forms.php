<?php
use Gt\Dom\HTMLDocument;
use Gt\Input\Input;

function go(Input $input, HTMLDocument $document):void {
	$document->querySelector("#form-result")->hidden = !$input->contains("example");
}
