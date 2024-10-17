package main

import (
	"fmt"
	"os"
	"log"
	"database/sql"
	// "html/template"
	"net/http"
	"time"
	_ "github.com/mattn/go-sqlite3" 
)

type Page struct {
	Id int
	Title string
	Body []byte
	CreatedAt string
	UpdatedAt string
}

// func (p *Page) save() error {
// 	filename := p.Title + ".txt"
// 	return os.WriteFile(filename, p.Body, 0600)
// }

// func loadPage(title string) (*Page, error) {
// 	filename := title + ".txt"
// 	body, err := os.ReadFile(filename)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return &Page{Title: title, Body: body}, nil
// }

func main() {
	// os.Remove("TestPage.txt")
	os.Remove("sqlite-database.db")

	file, err := os.Create("sqlite-database.db")
	if err != nil {
		log.Fatal(err.Error())
	}
	file.Close()
	
	mydb, _ := sql.Open("sqlite3", "./sqlite-database.db")
	defer mydb.Close()

	initializeDB(mydb)
	
	insertPage(mydb, "Test Title", []byte("Here is some sample text for my initial page."))
	insertPage(mydb, "Title #2", []byte("Here is some sample text for my second page."))

	getPages(mydb)

	// p1 := &Page{Title: "TestPage", Body: []byte("This is sample page content.")}
	// p1.save()
	// p2, _ := loadPage("TestPage")
	// fmt.Println(string(p2.Body))

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", root_handler)

	log.Fatal(http.ListenAndServe(":8080", mux))
}

func root_handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Slug: %s\nHeader: %s", r.URL.Path[1:], r.Header)
}

func initializeDB(db *sql.DB) {
	initPageSQL := `CREATE TABLE IF NOT EXISTS page (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		title TEXT,
		body BLOB,
		created_at TEXT,
		updated_at TEXT
	);`
	statement, err := db.Prepare(initPageSQL)
	if err != nil {
		log.Fatal(err.Error())
	}
	statement.Exec()
}

func insertPage(db *sql.DB, title string, body []byte) {
	insertPageSQL := `INSERT INTO page(title, body, created_at, updated_at) VALUES(?, ?, ?, ?)`
	statement, err := db.Prepare(insertPageSQL)
	if err != nil {
		log.Fatal(err.Error())
	}
	created_at := time.Now().Format(time.RFC3339)
	updated_at := created_at
	statement.Exec(title, body, created_at, updated_at)
}

func getPages(db *sql.DB) {
	rows, err := db.Query(`SELECT * FROM page`)
	if err != nil {
		log.Fatal(err.Error())
	}
	defer rows.Close()
	var pages []Page
	for rows.Next() {
		var page Page
		rows.Scan(&page.Id, &page.Title, &page.Body, &page.CreatedAt, &page.UpdatedAt)
		pages = append(pages, page)
	}
	
	for _, myrow := range pages {
		fmt.Println(string(myrow.Body))
	}
}