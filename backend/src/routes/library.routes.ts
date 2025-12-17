import { Router } from "express";
import { LibraryController } from "../controllers/library.controller.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware.ts";

const router = Router();
const libraryController = new LibraryController();

// Books
router.get("/books", authenticate, libraryController.getBooks);
router.get("/books/search", authenticate, libraryController.searchBooks);
router.get("/books/:id", authenticate, libraryController.getBookById);

router.post(
  "/books",
  authenticate,
  authorize("librarian", "admin"),
  [body("title").notEmpty(), body("author").notEmpty(), validateRequest],
  libraryController.addBook
);

router.put(
  "/books/:id",
  authenticate,
  authorize("librarian", "admin"),
  libraryController.updateBook
);

router.delete(
  "/books/:id",
  authenticate,
  authorize("librarian", "admin"),
  libraryController.deleteBook
);

// Issues
router.post(
  "/issue",
  authenticate,
  authorize("librarian", "admin"),
  [body("bookId").isNumeric(), body("userId").isNumeric(), validateRequest],
  libraryController.issueBook
);

router.post(
  "/return/:issueId",
  authenticate,
  authorize("librarian", "admin"),
  libraryController.returnBook
);

router.post("/renew/:issueId", authenticate, libraryController.renewBook);

router.get("/user/:userId/books", authenticate, libraryController.getUserBooks);
router.get(
  "/issues",
  authenticate,
  authorize("librarian", "admin"),
  libraryController.getAllActiveIssues
);
router.get(
  "/overdue",
  authenticate,
  authorize("librarian", "admin"),
  libraryController.getOverdueBooks
);
router.get(
  "/statistics",
  authenticate,
  authorize("librarian", "admin"),
  libraryController.getLibraryStatistics
);

export default router;
