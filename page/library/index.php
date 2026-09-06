<?php
use Gt\Http\Response;
use Gt\Http\ResponseStatusException\ClientError\HttpNotFound;
use Gt\Input\Input;

function go(Input $input, Response $response):void {
	$section = $input->getString("section") ?? "home";
	if($section === "home") {
		$response->redirect("/");
		return;
	}
	if($section === "playground") {
		$response->redirect("/playground/");
		return;
	}
	if(!in_array($section, ["typography", "controls", "forms", "surfaces", "navigation", "disclosures", "tables", "feedback", "code", "layouts"], true)) {
		throw new HttpNotFound();
	}
	$response->redirect("/library/$section/");
}
