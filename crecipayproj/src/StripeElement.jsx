try {
  // Find the selected bank account details based on the selected bankAccountId
  const selectedBankAccount = bankAccounts.find(account => account.id.id === bankAccountId);
  
  if (!selectedBankAccount) {
      throw new Error('Selected bank account not found');
  }


  <Carousel className="carousel-container">
          <CarouselPrevious className="carousel-previous">&lt;</CarouselPrevious>
          <CarouselContent className="carousel-content">
            {bankAccounts.map((account, index) => (
              <CarouselItem className='carousel-item' key={index}>
                <div >
                  <p><strong>Fund Name:</strong> {account.name}</p>
                  <p><strong>Type:</strong> {account.type}</p>
                  <p><strong>Account:</strong> ****{account.last4}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="carousel-next">&gt;</CarouselNext>
        </Carousel>