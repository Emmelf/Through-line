<?php

namespace App\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class PingController
{
    #[Route('/api/ping', name: 'ping', methods: ['GET'])]
    public function pingAction(): JsonResponse
    {
        return new JsonResponse(['message' => 'pong']);
    }
}
