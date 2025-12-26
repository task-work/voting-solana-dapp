// Here we export some useful types and functions for interacting with the Anchor program.
import VotingIDL from '../target/idl/voting.json'

// Re-export the generated IDL and type
export { VotingIDL }

export * from './client/js'
