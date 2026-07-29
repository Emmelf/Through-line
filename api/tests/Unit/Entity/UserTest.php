<?php

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testUserWithoutPasswordAndGoogleIdIsInvalid(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setUsername('testuser');

        $this->assertNull($user->getPassword());
        $this->assertNull($user->getGoogleId());
    }

    public function testUserWithValidEmailIsValid(): void
    {
        $user = new User();
        $user->setEmail('valid@example.com');
        $user->setUsername('testuser');
        $user->setPassword('hashed_password');

        $this->assertEquals('valid@example.com', $user->getEmail());
        $this->assertNotNull($user->getPassword());
    }

    public function testUserRolesAreCorrectlyAssigned(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setUsername('testuser');
        $user->setPassword('hashed_password');
        $user->setRoles(['ROLE_ADMIN']);

        $roles = $user->getRoles();

        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testDefaultUserRoleIsAssigned(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setUsername('testuser');
        $user->setPassword('hashed_password');
        $user->setRoles([]);

        $roles = $user->getRoles();

        $this->assertContains('ROLE_USER', $roles);
        $this->assertCount(1, $roles);
    }

    public function testUserIdentifierReturnEmail(): void
    {
        $user = new User();
        $user->setEmail('test@example.com');

        $this->assertEquals('test@example.com', $user->getUserIdentifier());
    }

    public function testGoogleIdCanBeSet(): void
    {
        $user = new User();
        $user->setGoogleId('google_12345');

        $this->assertEquals('google_12345', $user->getGoogleId());
    }

    public function testUsernameCanBeSet(): void
    {
        $user = new User();
        $user->setUsername('testuser');

        $this->assertEquals('testuser', $user->getUsername());
    }
}
