<?php
// src/Controller/RegistrationController.php
namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'register', methods: ['POST'])]
    public function register(
        UserPasswordHasherInterface $passwordHasher,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator

    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $validationError = $this->findInputError($data, $entityManager);
        if ($validationError !== null) {
            return $validationError;
        }

        $email = $data['email'];
        $password = $data['password'];
        $username = $data['username'];

        // Create new user
        $user = new User();
        $user->setEmail($email);
        $user->setUsername($username);
        $user->setRoles(['ROLE_USER']);

        // Hash the password
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        // Validate the user entity
        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Save to database
        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
                'roles' => $user->getRoles()
            ]
        ], Response::HTTP_CREATED);
    }

    private function findInputError(mixed $data, EntityManagerInterface $entityManager): ?JsonResponse
    {
        if (!isset($data['email'], $data['password'], $data['username'])) {
            return new JsonResponse(['error' => 'Email, password and username are required'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!is_string($data['username']) || mb_strlen($data['username']) > 16) {
            return new JsonResponse(['error' => 'Username must be at most 16 characters'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $repository = $entityManager->getRepository(User::class);
        if ($repository->findOneBy(['email' => $data['email']])) {
            return new JsonResponse(['error' => 'User with this email already exists'], Response::HTTP_CONFLICT);
        }

        if ($repository->findOneBy(['username' => $data['username']])) {
            return new JsonResponse(['error' => 'Username already taken'], Response::HTTP_CONFLICT);
        }

        return null;
    }
}
