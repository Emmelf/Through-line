<?php

namespace App\Service;

use App\Exception\GoogleOAuthException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GoogleOAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;
    private HttpClientInterface $httpClient;

    public function __construct(
        string $googleClientId,
        string $googleClientSecret,
        string $googleRedirectUri,
        HttpClientInterface $httpClient
    ) {
        $this->clientId = $googleClientId;
        $this->clientSecret = $googleClientSecret;
        $this->redirectUri = $googleRedirectUri;
        $this->httpClient = $httpClient;
    }

    /**
     * Generate a random state parameter for CSRF protection
     */
    public function generateState(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Generate Google OAuth authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'state' => $state,
        ];

        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token and get user info
     *
     * @param string $code Authorization code from Google
     * @return array User info from Google (email, name, picture, sub)
     * @throws GoogleOAuthException
     */
    public function getUserInfo(string $code): array
    {
        // Exchange code for access token
        $tokenResponse = $this->httpClient->request('POST', 'https://oauth2.googleapis.com/token', [
            'json' => [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->redirectUri,
            ],
        ]);

        $tokenData = $tokenResponse->toArray();

        if (!isset($tokenData['access_token'])) {
            throw new GoogleOAuthException('Failed to obtain access token from Google');
        }

        // Fetch user info using access token
        $userResponse = $this->httpClient->request('GET', 'https://www.googleapis.com/oauth2/v2/userinfo', [
            'headers' => [
                'Authorization' => 'Bearer ' . $tokenData['access_token'],
            ],
        ]);

        $userInfo = $userResponse->toArray();

        if (!isset($userInfo['email'])) {
            throw new GoogleOAuthException('Failed to retrieve email from Google');
        }

        return [
            'google_id' => $userInfo['id'] ?? null,
            'email' => $userInfo['email'],
            'name' => $userInfo['name'] ?? '',
            'picture' => $userInfo['picture'] ?? null,
            'verified_email' => $userInfo['verified_email'] ?? false,
        ];
    }
}
